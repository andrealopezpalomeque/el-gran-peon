import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listPublishedPosts,
  listAllPosts,
  getPost,
  getPostAdmin,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/blogController.js'

const router = Router()

// Public
router.get('/', listPublishedPosts)
// Protected — declared BEFORE /:slug to avoid Express matching "all" or "admin" as slug
router.get('/all', requireAuth, listAllPosts)
router.get('/admin/:id', requireAuth, getPostAdmin)
// Public
router.get('/:slug', getPost)
// Protected
router.post('/', requireAuth, createPost)
router.put('/:id', requireAuth, updatePost)
router.delete('/:id', requireAuth, deletePost)

export default router
