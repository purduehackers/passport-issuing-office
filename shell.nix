{ pkgs ? import <nixpkgs> {} }:
let
  vercel = pkgs.writeShellScriptBin "vercel" ''
    exec ${pkgs.nodejs_22}/bin/npx --yes vercel "$@"
  '';
in
pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    deno
    pkgconf
    nodejs_22
    vercel
  ];
}
