# DESIGN.md

## 1. Overview
Small social-media backend: users create posts (with hashtags), follow/unfollow, like/unlike, and an activity log. DB used in this assignment: SQLite (development). Design targets correctness, simple indexing for common reads, and a straightforward path to scale.

---

## 2. Schema (tables & core columns)
**users**
- `id` (PK), `firstName`, `lastName`, `email` (unique), `createdAt`, `updatedAt`

**posts**
- `id` (PK), `content`, `authorId` (FK → users.id, `ON DELETE CASCADE`), `createdAt`, `updatedAt`

**hashtags**
- `id` (PK), `tag` (unique, store lowercase), `createdAt`

**posts_hashtags**
- `postId` (FK → posts.id), `hashtagId` (FK → hashtags.id) — PK `(postId, hashtagId)`

**likes**
- `id` (PK), `userId` (FK → users.id), `postId` (FK → posts.id), `createdAt`
- UNIQUE(userId, postId)

**follows**
- `id` (PK), `followerId` (FK → users.id), `followingId` (FK → users.id), `createdAt`
- UNIQUE(followerId, followingId)

**activities**
- `id` (PK), `type` (`post`, `like`, `follow`, `unfollow`), `actorId` (FK → users.id), `postId` (FK → posts.id, NULLABLE, `ON DELETE SET NULL`), `targetUserId` (FK → users.id, NULLABLE), `createdAt`

---

## 3. Relationships (summary)
- users 1→N posts, likes, activities
- posts N↔N hashtags (via posts_hashtags)
- follows links users to users (follower → following)
- activities is an append-only log used for feed & activity history

---

## 4. Indexing (essential)
- `users(email)` UNIQUE
- `posts(authorId, createdAt DESC)`, `posts(createdAt DESC)`
- `posts_hashtags(hashtagId, postId)`
- `hashtags(tag)` UNIQUE (store lowercase)
- `likes(userId, postId)` UNIQUE, index `likes(postId)`
- `follows(followingId, createdAt DESC)`
- `activities(type, actorId, createdAt DESC)` and `activities(actorId, createdAt DESC)`

These support fast feed, hashtag, and follower queries.

---

## 5. Typical queries (short)
- Feed: get `activities` where `type='post'` and `actorId IN (followees)` → join `posts`.
- Hashtag: join `posts_hashtags` → `posts` → filter `LOWER(tag)=:tag`.
- Followers: select from `follows` where `followingId=:id` order by `createdAt DESC`.
- Activity: select from `activities` where `actorId=:id` order by `createdAt DESC`.

Prefer cursor pagination for real scale.

---

## 6. Scalability & production notes
- **Migrate to Postgres** for production (function indexes, replication, better concurrency).
- **Caching** (Redis) for follower lists, like counts, and hot feed pages.
- **Feed strategy**: fan-out-on-write (push to followers) for low-latency reads; fan-out-on-read for simpler design; hybrid for heavy users.
- **Background workers & queues** for hashtag extraction, notifications, and feed precompute.
- **Partition/Archive** old `activities` by time or user to control table size.
- **Soft deletes** (`deletedAt`) recommended in prod to preserve history.

---

## 7. Operational & integrity notes
- Wrap multi-step writes in transactions (create post → attach hashtags → create activity).
- Enforce uniqueness constraints to avoid dup likes/follows.
- Validate input (emails, content length) and authorize actions.
- Keep `activities` append-only (set FK to NULL on deletions) to preserve audit history.

---

