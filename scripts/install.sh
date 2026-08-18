#!/usr/bin/env sh
# Install the invoca-toolkit CLI by downloading the latest prebuilt binary
# from GitHub Releases.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/spenserhale/invoca-ai-toolkit/main/scripts/install.sh | sh

set -eu

REPO="spenserhale/invoca-ai-toolkit"
VERSION="${INVOCA_TOOLKIT_VERSION:-latest}"
INSTALL_DIR="${INVOCA_TOOLKIT_INSTALL:-$HOME/.local/bin}"

detect_platform() {
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)
  case "$os" in
    darwin) os="darwin" ;;
    linux)  os="linux" ;;
    *) echo "Unsupported OS: $os"; exit 1 ;;
  esac
  case "$arch" in
    x86_64|amd64)  arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) echo "Unsupported arch: $arch"; exit 1 ;;
  esac
  echo "${os}-${arch}"
}

platform=$(detect_platform)
asset="invoca-${platform}"
if [ "$VERSION" = "latest" ]; then
  url="https://github.com/${REPO}/releases/latest/download/${asset}"
else
  url="https://github.com/${REPO}/releases/download/${VERSION}/${asset}"
fi
checksum_url="${url}.sha256"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

echo "Downloading $asset..."
curl -fsSL -o "$tmp/$asset" "$url"
curl -fsSL -o "$tmp/$asset.sha256" "$checksum_url"

echo "Verifying checksum..."
(cd "$tmp" && shasum -a 256 -c "$asset.sha256") || {
  echo "Checksum verification failed"
  exit 1
}

mkdir -p "$INSTALL_DIR"
install_path="$INSTALL_DIR/invoca"
mv "$tmp/$asset" "$install_path"
chmod +x "$install_path"

echo ""
echo "Installed invoca to $install_path"
case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    echo ""
    echo "Note: $INSTALL_DIR is not on your PATH. Add the following to your shell profile:"
    echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac
echo ""
echo "Run 'invoca --help' to get started."
