{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
    nativeBuildInputs = with pkgs.buildPackages; [
        nodePackages.pnpm
        nodejs_21
    ];
}
