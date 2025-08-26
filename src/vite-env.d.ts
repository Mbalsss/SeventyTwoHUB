/// <reference types="vite/client" />
/// <reference types="vite/client" />

// Add this interface to get type safety for your environment variables
interface ImportMetaEnv {
    readonly VITE_DEV_BYPASS_ENABLED: string
    // Add other environment variables here as you create them
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}