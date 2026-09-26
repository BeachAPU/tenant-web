import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
        },
    },
    esbuild: {
        loader: 'tsx',
        include: /src\/.*\.tsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                {
                    name: 'load-js-files-as-tsx',
                    setup(build) {
                        build.onLoad(
                            { filter: /src\\.*\.js$/ },
                            async (args) => ({
                                loader: 'tsx',
                                contents: await fs.readFile(args.path, 'utf8'),
                            })
                        );
                    },
                },
            ],
        },
    },
    build: {
        outDir: 'dist', // ✅ this is required for Netlify
    },
    server: {
        // Bind to all interfaces so the dev server is reachable through the
        // Docker port mapping / Traefik, not just from inside the container.
        host: true,
        // Traefik forwards requests with Host: <APP_DOMAIN>/<APP_DOMAIN_DEMO>
        // (see docker-compose.dev.yml routers). Vite blocks unrecognized
        // Host headers by default, so allow the domains .env configures.
        allowedHosts: [process.env.APP_DOMAIN, process.env.APP_DOMAIN_DEMO].filter(
            (h): h is string => Boolean(h)
        ),
        proxy: {
            '/api': `http://localhost:${process.env.PORT || 3000}`,
        },
    },
    plugins: [
        // Same options as admin-ui's vite-plugin-svgr: `import { ReactComponent as X } from './x.svg'`
        // for src/icons (DESIGN.md §12), while the default export stays the file URL for <img src>.
        svgr({ icon: true, exportType: 'named', namedExport: 'ReactComponent' }),
        react(),
    ],
});
