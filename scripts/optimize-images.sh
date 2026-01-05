#!/bin/bash

# Image Optimization Script
# Optimizes advertisement and sponsor images to reduce file sizes

echo "🖼️  Starting image optimization..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}⚠️  ImageMagick not installed. Installing via Homebrew...${NC}"
    brew install imagemagick
fi

# Function to optimize images in a directory
optimize_directory() {
    local dir=$1
    local pattern=$2
    
    echo -e "\n${GREEN}📁 Processing $dir/${NC}"
    
    for img in "$dir"/$pattern; do
        if [ -f "$img" ]; then
            original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
            
            # Create optimized version
            convert "$img" -strip -quality 85 -resize '1920x1920>' "${img}.tmp"
            
            optimized_size=$(stat -f%z "${img}.tmp" 2>/dev/null || stat -c%s "${img}.tmp")
            
            # Only replace if smaller
            if [ $optimized_size -lt $original_size ]; then
                mv "${img}.tmp" "$img"
                saved=$((original_size - optimized_size))
                saved_kb=$((saved / 1024))
                echo -e "  ✓ $(basename "$img"): ${saved_kb}KB saved"
            else
                rm "${img}.tmp"
                echo -e "  → $(basename "$img"): Already optimized"
            fi
        fi
    done
}

# Optimize advertisements
optimize_directory "public/advertisements" "*.{jpg,jpeg,png,JPG,JPEG,PNG}"

# Optimize sponsors
optimize_directory "public/sponsors" "*.{jpg,jpeg,png,JPG,JPEG,PNG}"

echo -e "\n${GREEN}✅ Image optimization complete!${NC}"
