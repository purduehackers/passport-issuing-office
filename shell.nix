{
  pkgs ? import <nixpkgs> {
    overlays = [
      (import (fetchTarball "https://github.com/oxalica/rust-overlay/archive/master.tar.gz"))
    ];
  },
}:
let
  vercel = pkgs.writeShellScriptBin "vercel" ''
    exec ${pkgs.nodejs_22}/bin/npx --yes vercel "$@"
  '';
  rust = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
in
pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    deno
    pkgconf
    nodejs_22
    vercel
    rust
  ];
}
