import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
// !! REPLACE 'YOUR_REPO_NAME' with the actual name of your GitHub repository !!
const repositoryName = 'chat.entity'; 

const nextConfig: NextConfig = {
  output: "export",
  
  // REQUIRED FOR GITHUB PAGES SUBDIRECTORY HOSTING:
  basePath: isProd ? `/${repositoryName}` : '',
  assetPrefix: isProd ? `/${repositoryName}/` : '',

  // Optional: Disable server-side image optimization, which isn't supported on GH Pages
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;
