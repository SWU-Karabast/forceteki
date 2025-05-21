# Get the date in YY.MM.DD format
current_date=$(date +%y.%m.%d)

 # Get the latest release tag
 latest_release=$(git tag --sort=-creatordate | grep -E "^v[0-9]{2}\.[0-9]{2}\.[0-9]{2}(\.[0-9]+)?$" | head -n 1)
 
 # If latest release was today
 if [[ "$latest_release" == "v$current_date"* ]]; then
    # Increment the patch version number using the inc-patch-ver.sh script
    new_version="$("$(dirname "$0")/inc-patch-ver.sh" "$latest_release")"
 else
     # Otherwise use the current date as the version
     new_version="v$current_date"
 fi
 
 echo $new_version
