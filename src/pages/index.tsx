import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useCallback } from 'react';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const [nextPage, setNextPage] = useState(next_page);
  const [postsPublished, setPostsPublished] = useState(results);

  postsPublished.forEach(post => {
    post.first_publication_date = format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    );
  });

  const loadMorePosts = useCallback(async () => {
    if (next_page) {
      try {
        const postResults = await fetch(`${nextPage}`).then(response =>
          response.json()
        );

        const posts = postResults.results.map(post => {
          const postFormatted: Post = {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };

          return postFormatted;
        });

        setPostsPublished(oldValues => [...oldValues, ...posts]);
        setNextPage(postResults.next_page);
      } catch (err) {
        alert('deu ruim');
      }
    }
  }, [next_page, nextPage]);

  return (
    <div className={styles.container}>
      <img src="Logo.svg" alt="logo" />

      {postsPublished.map(post => (
        <Link href={`/post/${post.uid}`} key={post.uid}>
          <a className={styles.post}>
            <h2>{post.data.title}</h2>
            <p>{post.data.subtitle}</p>

            <section>
              <div>
                <img src="/images/calendar.svg" alt="calendar" />
                <p>{post.first_publication_date}</p>
              </div>

              <div>
                <img src="/images/user.svg" alt="user" />
                <p>{post.data.author}</p>
              </div>
            </section>
          </a>
        </Link>
      ))}

      {next_page && (
        <button type="button" onClick={loadMorePosts}>
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 2 }
  );

  const posts = postsResponse.results.map(post => {
    const postFormatted: Post = {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };

    return postFormatted;
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return { props: { postsPagination } };
};
