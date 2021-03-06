import React from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

import * as routes from '../routes'
import Tag from '../components/Tag'
import { get, highlight } from '../lib/utils'

import dayjs from 'dayjs'
import { Poem as PoemType, useStarPoemMutation, useRecitePoemMutation, Author, Tag as TagType } from '../query'

dayjs.extend(relativeTime)

const { Link, Router } = routes

interface Props {
  poem: Partial<Omit<PoemType, 'author' | 'tags'>> &
    { author?: Partial<Author>, tags?: Array<Partial<TagType>> } & Pick<PoemType, 'id'>;
  active?: boolean;
  onMore?: () => void;
  time?: Date;
  title?: string;
  highlightWords?: any[];
}

function Poem ({
  poem,
  highlightWords = [],
  active = true,
  onMore,
  time,
  title = 'h2'
}: Props) {
  const [starPoem] = useStarPoemMutation({
    optimisticResponse({ poemId, star }) {
      return {
        __typename: 'Mutation',
        starPoem: {
          id: poemId,
          userIsStar: star,
          __typename: 'Poem'
        }
      }
    }
  })

  const [recitePoem] = useRecitePoemMutation({
    optimisticResponse({ poemId, recite }) {
      return {
        __typename: 'Mutation',
        recitePoem: {
          id: poemId,
          userIsRecite: recite,
          __typename: 'Poem'
        }
      }
    } 
  })

  const handleStar = (poemId: string, star: boolean) => {
    starPoem({
      variables: {
        poemId,
        star
      } 
    }) 
  }

  const handleRecite = (poemId: string, recite: boolean) => {
    recitePoem({
      variables: {
        poemId,
        recite
      } 
    }) 
  }

  const goLogin = () => {
    Router.pushRoute('/login')
  }

  const author = poem.author

  return <div>
    <style jsx>{`
      time {
        color: #aaa;
        margin-left: auto;
        font-family: defalut;
      }
      .more {
        cursor: pointer; 
      }
      .footer {
        display: flex; 
        align-items: center;
        flex-wrap: wrap;
        color: #aaa;
        min-height: 28px;
      }
      .tag-item {
        cursor: pointer; 
        font-size: 1rem;
      }
      .tag-item:hover {
        color: #f60c;
      }
      .tag-item:not(:last-child):after {
        content: "/";
        margin: 0 .2em;
        color: #b2bac2;
      }
    `}</style>
    <div className="poem">
      {
        React.createElement(title, {
          children: poem.id ?
            <Link route="poem" params={{ id: poem.id }}>
              <a>
                {
                  highlight(poem.title, highlightWords)
                }
              </a>
            </Link> : highlight(poem.title, highlightWords)
        }) 
      }
      {
        author && <div className="author">
          <Link route="author" params={{ id: author.id }}>
            <a>
              { get(poem, 'author.dynasty') }·{ get(poem, 'author.name') }
            </a>
          </Link>
        </div>
      }
      <div>
        {
          // 当折叠时，只显示四段
          poem.paragraphs.slice(0, active ? undefined : 4).map((p: any, index: any) => (
            <p key={index}>
              { highlight(p, highlightWords) }
            </p>
          )) 
        } 
        {
          !active && poem.paragraphs.length > 4 && <p className="more" onClick={onMore}>
          ...
          </p>
        }
      </div>
    </div>
    <div className="footer">
      <Tag
        onChange={() => poem.userIsStar === null ? goLogin() : handleStar(poem.id, !poem.userIsStar)}
        checked={Boolean(poem.userIsStar)}
      >喜欢</Tag>
      <Tag
        onChange={() => poem.userIsStar === null ? goLogin() : handleRecite(poem.id, !poem.userIsRecite)}
        checked={Boolean(poem.userIsRecite)}
      >会背</Tag>
      {
        time && <time>{
          dayjs(new Date()).diff(time, 'day') > 60 ?
            dayjs(time).format('YYYY-MM-DD HH:mm') : dayjs(time).locale('zh-cn').fromNow()
        }</time>
      }
      {
        poem.tags?.map(tag => 
          <Link route="poems" params={{ tagId: tag.id, tagName: tag.name }} key={tag.id}>
            <div className="tag-item">{tag.name}</div>
          </Link>
        )
      }
    </div>
  </div>
}
 
export default Poem
