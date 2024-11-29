export function getEnv(keyName) { 
    for (const key in process.env) {
        if (key == keyName) {
            return process.env[key]
        }
    }
}