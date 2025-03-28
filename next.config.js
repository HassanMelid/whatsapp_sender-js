/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            config.module.rules.push({
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            });
        }

        // Ignorar advertencias de source maps
        config.ignoreWarnings = [
            { module: /node_modules\/next\/dist\/compiled\/@next\/react-refresh-utils/ },
        ];

        return config;
    },
    // Asegurarse de que Next.js no intente comprimir los archivos
    compress: false,
    // Habilitar la depuración en desarrollo
    devIndicators: {
        buildActivity: true,
    },
};

module.exports = nextConfig;

