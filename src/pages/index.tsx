/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import calendarImg from '../assets/calendar.png';
import userImg from '../assets/user.png';
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

const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  const { results } = postsPagination;

  return (
    <div className={styles.container}>
      {results.map(post => (
        <Link href="/" key={post.uid}>
          <a>
            <h2>{post.data.title}</h2>
            <p>{post.data.subtitle}</p>
            <div>
              <img src="./calendar.png" alt="Calendar" />
              {/* <img src={userImg} alt="User" /> */}
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.content'],
      pageSize: 100,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: 'test',
        author: 'test',
      },
    };
  });

  const postsPagination = {
    next_page: 0,
    results: posts,
  };

  return {
    props: { postsPagination },
  };
};

export default Home;
