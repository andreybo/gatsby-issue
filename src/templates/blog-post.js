import { graphql } from "gatsby";
import * as React from "react";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { GatsbyImage } from "gatsby-plugin-image";
import Comments from "../components/comments";
import Subscribe from "../components/subscribe";
import Trends from "../components/trends";
import Categories from "../components/categories";
import Blur from "../components/blur";
import Related from "../components/related";
import Ads from "../components/ads";
import Moment from 'moment';


export default function BlogPost({ data }) {
  const post = data.wpPost
  
  return (
    <Layout>
      <Seo title={post.title} seo={post.seo} />
      <Blur/>
      <div className="post post__container container">
        <div className="post__row row">
          <div className="post__col post__col--left col-md-7 col-12">
            <div className="post__out">
              <div className="post__head">
                  <GatsbyImage
                    image={post.featuredImage ==null ? null : post.featuredImage.node.localFile.childImageSharp.gatsbyImageData}
                    alt={post.title}
                    objectFit='cover'
                  />
                <h1 className="post__head--title">{post.title}</h1>
                <p className="post__head--author">
                  by <b>{post.author ? post.author.node.name : ''}</b>,&nbsp; 
                  <time dateTime={post.modified}>{Moment(post.modified).format('MMMM D, YYYY')}</time>
                </p>
              </div>
              <div className="post__content">
                <div
                  className="blog-post-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
              <div className="post__border post__border--first">
                <GatsbyImage
                  alt='hot'
                  objectFit='contain'
                  className='post__border--image'
                  image={
                    data.down.childImageSharp
                      .gatsbyImageData
                  }
                />
              </div>
            </div>
              <div className="post__about">
                <div className="post__border post__border--second">
                  <GatsbyImage
                    alt='hot'
                    objectFit='contain'
                    className='post__border--image'
                    image={
                      data.up.childImageSharp
                        .gatsbyImageData
                    }
                  />
                </div>
              </div>
              <GatsbyImage
                alt='hot'
                objectFit='contain'
                className='post__hot--image'
                image={
                  data.hotImage.childImageSharp
                    .gatsbyImageData
                }
              />
              <Subscribe buttonId="postform"/>
              <div className="post__related">
                <div className="hp__row row">
                  <Related posts={post.related_posts} title={post.title} limit={4} classmain="col-md-6 col-12 gobottom" layoutHorizontal={true} titleh3={true}/>
                </div>
              </div>
              <div className="post__comments">
                <h3>
                  Comments
                </h3>
                <Comments slug={post.slug} title={post.title} id={post.id}/>
              </div>
              
          </div>
          <div className="col-md-5 col-12 postLeft">
            <div className="gap-container">
              <Trends/>
              <div className="postLeft__subscribe">
                <Subscribe buttonId="ud-sidebarform"/>
              </div>
              <Ads/>
              <Related posts={post.related_posts} title={post.title} limit={2} classmain="postLeft__related gobottom" layoutHorizontal={true} titleh3={false}/>
              <Categories/>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
export const query = graphql`
  query($slug: String) {
    hotImage: file(relativePath: {eq: "icons/Ico03.png"}) {
      childImageSharp {
        gatsbyImageData(placeholder: BLURRED, formats: [AUTO, WEBP])
      }
    },
    up: file(relativePath: {eq: "up.png"}) {
      childImageSharp {
        gatsbyImageData(placeholder: BLURRED, formats: [AUTO, WEBP])
      }
    },
    down: file(relativePath: {eq: "down.png"}) {
      childImageSharp {
        gatsbyImageData(placeholder: BLURRED, formats: [AUTO, WEBP])
      }
    },
    wpPost(slug: { ne: "", eq: $slug }) {
      content
      id
      author{
        node{
          name
        }
      }
      title
      categories{
        nodes{
          name
          slug
        }
      }
      date
      modified
      slug
      excerpt
      seo {
        metaDesc
        metaKeywords
        title
        opengraphImage {
          sourceUrl
        }
      }
      tags{
        nodes{
          name
        }
      }
      uri
      featuredImage {
        node{
          localFile {
            childImageSharp {
              gatsbyImageData(placeholder: BLURRED, formats: [AUTO, WEBP])
            }
          }
        }
      }
      related_posts {
        nodes {
          title
          uri
          featuredImage {
            node{
              localFile {
                childImageSharp {
                  gatsbyImageData(placeholder: BLURRED, formats: [AUTO, WEBP])
                }
              }
            }
          }
          tags{
            nodes{
              name
            }
          }
          excerpt
          seo{
            title
            metaDesc
          }
        }
      }
    }
  }
`