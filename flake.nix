{
  description = "Clean demo chatbot MongoDB collections";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_20;
        gcloud = pkgs.google-cloud-sdk.withExtraComponents [
          pkgs.google-cloud-sdk.components.gke-gcloud-auth-plugin
        ];

        clean-demo = pkgs.buildNpmPackage {
          pname = "clean-demo";
          version = "1.0.0";

          src = ./.;

          npmDepsHash = "sha256-v/UkV0ZtcjALK+R2slODBnZfa5lHv6Mt2KXzioYsQwE=";

          nativeBuildInputs = [ nodejs ];

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            mkdir -p $out/bin $out/lib
            cp -r dist $out/lib/
            cp -r node_modules $out/lib/
            cp package.json $out/lib/

            cat > $out/bin/clean-demo << EOF
            #!${pkgs.bash}/bin/bash
            if ! command -v kubectl &> /dev/null; then
              export PATH="${pkgs.kubectl}/bin:${gcloud}/bin:\$PATH"
            fi
            export USE_GKE_GCLOUD_AUTH_PLUGIN=True
            exec ${nodejs}/bin/node $out/lib/dist/index.js "\$@"
            EOF
            chmod +x $out/bin/clean-demo
          '';

          meta = with pkgs.lib; {
            description = "Clean demo chatbot MongoDB collections";
            license = licenses.mit;
            maintainers = [ ];
          };
        };
      in
      {
        packages = {
          default = clean-demo;
          clean-demo = clean-demo;
        };

        apps = {
          default = {
            type = "app";
            program = "${clean-demo}/bin/clean-demo";
          };
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            nodejs
            pkgs.typescript
            pkgs.kubectl
          ];
          shellHook = ''
            export USE_GKE_GCLOUD_AUTH_PLUGIN=True
            echo "Development environment loaded"
            echo "Run 'npm install' to install dependencies"
            echo "Run 'npm run build' to build"
            echo "Run 'npm start' to run the script"
          '';
        };
      }
    );
}
