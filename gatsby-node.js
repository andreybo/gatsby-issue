const _ = require("lodash")
const fetch = require('node-fetch');

exports.createPages = async function ({ actions, graphql }) {

    const { data } = await graphql(`
      query {
        posts: allWpPost {
          edges {
            node {
                slug
                id
                guid
                categories{
                  nodes{
                    name
                    slug
                  }
                }
                uri
            }
          }
          totalCount
        }
        catGroup: allWpCategory {
          group(field: uri) {
            fieldValue
            sum(field: count)
          }
        }
      }
    `)

    // Create posts
    data.posts.edges.forEach(edge => {
      const postUri = edge.node.uri
      const postSlug = edge.node.slug
      const id = edge.node.id
      actions.createPage({
        path: postUri,
        id: id,
        component: require.resolve(`./src/templates/blog-post.js`),
        context: { slug: postSlug },
      })
    })

    // Make category pages
      data.catGroup.group.forEach(cat => {
        const catSlug = cat.fieldValue
        const catName = cat.fieldValue

        const posts = cat.sum
        const postsPerPage = 12
        const numPages = Math.ceil(posts / postsPerPage)
        Array.from({ length: numPages }).forEach((_, i) => {
          actions.createPage({
            path: i === 0 ? `${catSlug}` : `${catSlug}/${i + 1}`,
            component: require.resolve(`./src/templates/category-template.js`),
            context: {
              limit: postsPerPage,
              skip: i * postsPerPage,
              numPages,
              currentPage: i + 1,
              cat: catName,
              uri: catSlug
            },
          })
        })
      })

    // Make latest page
      const allposts = data.posts.totalCount
      const allpostsPerPage = 12
      const allnumPages = Math.ceil(allposts / allpostsPerPage)
      Array.from({ length: allnumPages }).forEach((_, i) => {
        actions.createPage({
          path: i === 0 ? `/latest` : `/latest/${i + 1}`,
          component: require.resolve(`./src/templates/blog-list.js`),
          context: {
            limit: allpostsPerPage,
            skip: i * allpostsPerPage,
            allnumPages,
            currentPage: i + 1,
          },
        })
      })

      // Make homepage
      actions.createPage({
        path: '/',
        id: 'homepage',
        component: require.resolve(`./src/templates/homepage.js`),
        context: { slug: '/' },
      })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type WpPost implements Node {
      related_posts: WpNodePost!
    }

    type WpNodePost implements Node {
      nodes: [WpPost]
    }
  `
  createTypes(typeDefs)
}


exports.createResolvers = ({
  actions,
  cache,
  createNodeId,
  createResolvers,
  getNode,
  store,
  reporter,
  schema
}) => {
  const { createNode, touchNode } = actions;

  // Add all media libary images so they can be queried by
  // childImageSharp
  createResolvers({
    WpPost: {
      related_posts: {
        resolve: async (source, args, context, info) => {
          const { databaseId } = source

          const response = await fetch(
            `https://website.co/wp-json/yarpp/v1/related/${databaseId}`
          ).then(res => res.json())

          if (response && response.length) {
            const result = await context.nodeModel.runQuery({
              query: {
                filter: { databaseId: { in: response.map(({ id }) => id) } },
              },
              type: 'WpPost',
            })
            return { nodes: result }
          } else return { nodes: [] }
        },
      },
    },

    WpMediaItem: {
      imageFile: {
        type: `File`,
        async resolve(source, args, context, info) {
          if (source.sourceUrl) {
            let fileNodeID;
            let fileNode;
            let sourceModified;

            // Set the file cacheID, get it (if it has already been set)
            const mediaDataCacheKey = `wordpress-media-${source.mediaItemId}`;
            const cacheMediaData = await cache.get(mediaDataCacheKey);

            if (source.modified) {
              sourceModified = source.modified;
            }

            // If we have cached media data and it wasn't modified, reuse
            // previously created file node to not try to redownload
            if (cacheMediaData && sourceModified === cacheMediaData.modified) {
              fileNode = getNode(cacheMediaData.fileNodeID);

              // check if node still exists in cache
              // it could be removed if image was made private
              if (fileNode) {
                fileNodeID = cacheMediaData.fileNodeID;
                // https://www.gatsbyjs.org/docs/node-creation/#freshstale-nodes
                touchNode({
                  nodeId: fileNodeID
                });
              }
            }

            // If we don't have cached data, download the file
            if (!fileNodeID) {
              try {
                // Get the filenode
                fileNode = await createRemoteFileNode({
                  url: source.sourceUrl,
                  store,
                  cache,
                  createNode,
                  createNodeId,
                  reporter
                });

                if (fileNode) {
                  fileNodeID = fileNode.id;

                  await cache.set(mediaDataCacheKey, {
                    fileNodeID,
                    modified: sourceModified
                  });
                }
              } catch (e) {
                // Ignore
                console.log(e);
                return null;
              }
            }

            if (fileNode) {
              return fileNode;
            }
          }
          return null;
        }
      }
    }
  })
}