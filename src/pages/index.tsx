import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const { results } = postsPagination;

  results.forEach(post => {
    post.first_publication_date = format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    );
  });

  return (
    <div className={styles.container}>
      <img src="Logo.svg" alt="Logo" />

      {results.map(post => (
        <div key={post.uid} className={styles.post}>
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
        </div>
      ))}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 20 }
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
