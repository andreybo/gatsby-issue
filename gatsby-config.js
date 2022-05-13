module.exports = {
  siteMetadata: {
    title: ``,
    description: ``,
    siteUrl: ``,
    author: ``,
    keywords: ""
  },
  plugins: [
  {
      resolve: 'gatsby-plugin-local-search',
      options: {
        // A unique name for the search index. This should be descriptive of
        // what the index contains. This is required.
        name: 'posts',

        // Set the search engine to create the index. This is required.
        // The following engines are supported: flexsearch, lunr
        engine: 'flexsearch',

        // Provide options to the engine. This is optional and only recommended
        // for advanced users.
        //
        // Note: Only the flexsearch engine supports options.
        engineOptions: {'tokenize':'forward'},

        // GraphQL query used to fetch all data for the search index. This is
        // required.
        query: `
          {
            allWpPost {
              nodes {
                  id
                  title
                  uri
                  content
                  excerpt
              }
            }
          }
        `,

        // Field used as the reference value for each document.
        // Default: 'id'.
        ref: 'id',

        // List of keys to index. The values of the keys are taken from the
        // normalizer function below.
        // Default: all fields
        index: ['title'],

        // List of keys to store and make available in your UI. The values of
        // the keys are taken from the normalizer function below.
        // Default: all fields
        store: ['id', 'path', 'title', 'excerpt'],

        // Function used to map the result from the GraphQL query. This should
        // return an array of items to index in the form of flat objects
        // containing properties to index. The objects must contain the `ref`
        // field above (default: 'id'). This is required.
        normalizer: ({ data }) =>
          data.allWpPost.nodes.map((node) => ({
            id: node.id,
            path: node.uri,
            title: node.title,
            content: node.content,
            excerpt: node.excerpt
          })),
      },
    },
  {
    resolve: `gatsby-source-wordpress`,
    options: {
      url: process.env.WPGRAPHQL_URL,
      develop: {
        hardCacheMediaFiles: true,
        hardCacheData: true,
      },
      type: {
        Post: {
          limit:
            process.env.NODE_ENV === `development` ? 50 : 5000,
        }
      }
    },
  },
  {
      resolve: `gatsby-plugin-disqus`,
      options: {
          shortname: `blog`
      }
  },
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        {
          resolve: 'gatsby-remark-images',
          options: {
            maxWidth: 1500,
            withWebp: true,
            showCaptions: true,
            quality: 100,
            linkImagesToOriginal: false,
          },
        },
        `gatsby-remark-lazy-load`
      ],
    },
  },
  {
    resolve: "gatsby-plugin-robots-txt",
    options: {
      host: "",
      sitemap: "",
      policy: [
        {
          userAgent: "*",
          disallow: "/api",
        },
      ],
    },
  },
  {
    resolve: `gatsby-plugin-sitemap`,
    options: {
      excludes: ["/404"],
    },
  },
    "gatsby-plugin-sass",
  {
    resolve: 'gatsby-plugin-google-analytics',
    options: {
      "trackingId": ""
    }
  },
  "gatsby-plugin-image",
  "gatsby-plugin-react-helmet",
  "gatsby-plugin-sitemap",
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: ``,
      short_name: ``,
      start_url: `/`,
      background_color: `#fff`,
      theme_color: `#fff`,
      display: `minimal-ui`,
      icon: `src/images/icon.png`
    },
  },
  {
    resolve: `gatsby-plugin-sharp`,
    options: {
      defaultQuality: 90,
      failOnError: false,
    },
  },
  "gatsby-transformer-sharp",
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": `images`,
      "path": `${__dirname}/src/images/`
    },
    __key: "images"
  },
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": `pages`,
      "path": `${__dirname}/src/pages/`
    },
    __key: "pages"
  },
  {
    resolve: `gatsby-plugin-gdpr-cookies`,
    options: {
      googleTagManager: {
        trackingId: '', // leave empty if you want to disable the tracker
        cookieName: 'gatsby-gdpr-google-tagmanager', // default
        dataLayerName: 'dataLayer', // default
      },
      environments: ["production", "development"],
    }
  },
  `gatsby-plugin-gatsby-cloud`
  ]
};