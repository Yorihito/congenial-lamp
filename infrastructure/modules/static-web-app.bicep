// Azure Static Web Apps module
@description('Static Web App name')
param staticWebAppName string

@description('Azure region (ignored - Static Web Apps uses limited regions)')
param location string

@description('Environment')
param environment string

// Static Web Apps only supports specific regions
// Using eastasia as closest to Japan
var staticWebAppLocation = 'eastasia'

// Static Web App (Free tier)
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: staticWebAppLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/Yorihito/congenial-lamp'
    branch: environment == 'prod' ? 'main' : 'develop'
    buildProperties: {
      appLocation: 'frontend'
      outputLocation: 'dist'
    }
  }
  tags: {
    environment: environment
  }
}

// Outputs
output defaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppId string = staticWebApp.id

#disable-next-line outputs-should-not-contain-secrets
output deploymentToken string = staticWebApp.listSecrets().properties.apiKey
