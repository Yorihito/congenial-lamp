// Main Bicep template for 心の距離マップ infrastructure
targetScope = 'resourceGroup'

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Application name prefix')
param appName string = 'koro-map'

// Variables
var uniqueSuffix = uniqueString(resourceGroup().id)
var staticWebAppName = 'swa-${appName}-${environment}'
var functionAppName = 'func-${appName}-${environment}-${uniqueSuffix}'
var storageAccountName = 'st${replace(appName, '-', '')}${environment}${take(uniqueSuffix, 6)}'
var appInsightsName = 'appi-${appName}-${environment}'
var keyVaultName = 'kv-${appName}-${environment}-${take(uniqueSuffix, 6)}'

// Storage Account for Functions and Table Storage
module storage 'modules/storage-account.bicep' = {
  name: 'storage-deployment'
  params: {
    storageAccountName: storageAccountName
    location: location
    environment: environment
  }
}

// Application Insights
module appInsights 'modules/app-insights.bicep' = {
  name: 'appinsights-deployment'
  params: {
    appInsightsName: appInsightsName
    location: location
  }
}

// Azure Functions
module functionApp 'modules/function-app.bicep' = {
  name: 'function-deployment'
  params: {
    functionAppName: functionAppName
    location: location
    storageAccountName: storageAccountName
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    appInsightsConnectionString: appInsights.outputs.connectionString
    environment: environment
  }
  dependsOn: [
    storage
  ]
}

// Key Vault
module keyVault 'modules/key-vault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    keyVaultName: keyVaultName
    location: location
    functionAppPrincipalId: functionApp.outputs.principalId
  }
}

// Static Web Apps (Free tier)
module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'staticwebapp-deployment'
  params: {
    staticWebAppName: staticWebAppName
    location: location
    environment: environment
  }
}

// Outputs
output staticWebAppUrl string = staticWebApp.outputs.defaultHostname
output functionAppUrl string = functionApp.outputs.functionAppUrl
output storageAccountName string = storage.outputs.storageAccountName
output keyVaultName string = keyVault.outputs.keyVaultName
output appInsightsName string = appInsights.outputs.appInsightsName
