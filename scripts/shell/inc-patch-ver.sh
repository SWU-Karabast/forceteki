#!/bin/bash

increment_version() {
    local version=$1
    
    # Remove the 'v' prefix
    version=${version#v}
    
    # Split the version into components
    IFS='.' read -ra version_parts <<< "$version"
    
    # If there's no patch number, add it
    if [ ${#version_parts[@]} -eq 3 ]; then
        version_parts+=("1")
    else
        # Increment the last part (patch number)
        last_index=$((${#version_parts[@]} - 1))
        version_parts[$last_index]=$((version_parts[last_index] + 1))
    fi
    
    # Join the parts back together and add 'v' prefix
    local new_version="v$(IFS='.'; echo "${version_parts[*]}")"
    echo "$new_version"
}

# Check if version argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

# Validate version format
if ! [[ $1 =~ ^v[0-9]{2}\.[0-9]{2}\.[0-9]{2}(\.[0-9]+)?$ ]]; then
    echo "Error: Version must be in format vYY.MM.DD or vYY.MM.DD.patch"
    exit 1
fi

new_version=$(increment_version "$1")
echo "$new_version"