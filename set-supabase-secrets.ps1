# Run this script to set Supabase function secrets
# You may need to install Supabase CLI first: npm install -g supabase

$projectRef = "pbrcqiqnxvldjotkqije"

# Read from .env file
$envContent = Get-Content "./.env" -Raw
$sendgridKey = ($envContent | Select-String 'EXPO_PUBLIC_SENDGRID_API_KEY=(.+)').Matches[0].Groups[1].Value
$sendgridFromEmail = ($envContent | Select-String 'EXPO_PUBLIC_SENDGRID_FROM_EMAIL=(.+)').Matches[0].Groups[1].Value
$sendgridFromName = ($envContent | Select-String 'EXPO_PUBLIC_SENDGRID_FROM_NAME=(.+)').Matches[0].Groups[1].Value

if (-not $sendgridKey) {
  Write-Error "Could not find SENDGRID_API_KEY in .env file"
  exit 1
}

Write-Host "Setting Supabase function secrets..."
Write-Host "Project: $projectRef"
Write-Host "SENDGRID_API_KEY: ${sendgridKey:0:10}... (length: $($sendgridKey.Length))"
Write-Host "SENDGRID_FROM_EMAIL: $sendgridFromEmail"
Write-Host "SENDGRID_FROM_NAME: $sendgridFromName"

# Set secrets using Supabase CLI
npx supabase secrets set SENDGRID_API_KEY="$sendgridKey" --project-ref $projectRef
npx supabase secrets set SENDGRID_FROM_EMAIL="$sendgridFromEmail" --project-ref $projectRef  
npx supabase secrets set SENDGRID_FROM_NAME="$sendgridFromName" --project-ref $projectRef

Write-Host "Secrets set! You may need to redeploy the function for changes to take effect:"
Write-Host "npx supabase functions deploy send-hidden-spot-review-email --project-ref $projectRef"
