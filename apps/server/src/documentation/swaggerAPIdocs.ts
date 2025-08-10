/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome to the API
 *     description: Welcome to the API
 *     responses:
 *       200:
 *         description: Welcome to the API
 *       500:
 *         description: Internal server error
 */

// -------------------------USER---------------------------------

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Routes for User Registration and Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               names:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - names
 *               - email
 *               - username
 *               - password
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad Request
 *       '409':
 *         description: User already exists
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               remember-me:
 *                 type: boolean
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '201':
 *         description: User login successfully
 *       '401':
 *         description: Wrong password
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */

// // -------------------------BLOG---------------------------------

// /**
//  * @swagger
//  * tags:
//  *   name: Blog
//  *   description: Routes for Blogs
//  */

// /**
//  * @swagger
//  * /blogs:
//  *   post:
//  *     summary: Add a new blog
//  *     tags: [Blog]
//  *     security:
//  *       - bearerAuth: []
//  *     consumes:
//  *       - multipart/form-data
//  *     parameters:
//  *       - name: title
//  *         in: formData
//  *         required: true
//  *         type: string
//  *       - name: content
//  *         in: formData
//  *         required: true
//  *         type: string
//  *       - name: author
//  *         in: formData
//  *         required: true
//  *         type: string
//  *       - name: excerpt
//  *         in: formData
//  *         type: string
//  *       - name: tags
//  *         in: formData
//  *         type: array
//  *         items:
//  *           type: string
//  *       - name: readingTime
//  *         in: formData
//  *         type: number
//  *       - name: featuredImage
//  *         in: formData
//  *         type: file  # This parameter allows file upload
//  *         description: Upload an image for the blog's featured image
//  *     responses:
//  *       201:
//  *         description: Blog added successfully
//  *       400:
//  *         description: Bad Request
//  *   get:
//  *     summary: Get all blogs
//  *     tags: [Blog]
//  *     responses:
//  *       200:
//  *         description: List of all blogs
//  *       500:
//  *         description: Internal Server Error 
//  */

// /**
//  * @swagger
//  * /blogs/{id}:
//  *   get:
//  *     summary: Get a blog by ID
//  *     tags: [Blog]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: ID of the blog to retrieve
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Blog retrieved successfully
//  *       404:
//  *         description: Blog not found
//  *       500:
//  *         description: Internal Server Error
//  * 
//  *   put:
//  *     summary: Update a blog by ID
//  *     tags: [Blog]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: ID of the blog to update
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/definitions/Blog'
//  *     responses:
//  *       200:
//  *         description: Blog updated successfully
//  *       400:
//  *         description: Bad Request
//  * 
//  *   delete:
//  *     summary: Delete a blog by ID
//  *     tags: [Blog]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: ID of the blog to delete
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Blog deleted successfully
//  *       404:
//  *         description: Blog not found
//  *       500:
//  *         description: Internal Server Error
//  */

// /**
//  * @swagger
//  * definitions:
//  *   Blog:
//  *     type: object
//  *     properties:
//  *       title:
//  *         type: string
//  *       content:
//  *         type: string
//  *       author:
//  *         type: string
//  *       featuredImage:
//  *         type: string
//  *       excerpt:
//  *         type: string
//  *       tags:
//  *         type: array
//  *         items:
//  *           type: string
//  *       readingTime:
//  *         type: number
//  *     required:
//  *       - title
//  *       - content
//  *       - author
//  *       - excerpt
//  *       - tags
//  *       - readingTime
//  */

// // -------------------------CONTACT---------------------------------
// /**
//  * @swagger
//  * tags:
//  *   name: Messages
//  *   description: Routes for Messages
//  */

// /**
//  * @swagger
//  * /contact:
//  *   post:
//  *     summary: Add a new message
//  *     tags: [Messages]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               names:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               message:
//  *                 type: string
//  *     required:
//  *       - names
//  *       - email
//  *       - message
//  *     responses:
//  *       200:
//  *         description: Message submitted successfully
//  *       400:
//  *         description: Bad Request
//  *       500:
//  *         description: Internal Server Error
//  *   get:
//  *     summary: Get all messages
//  *     tags: [Messages]
//  *     responses:
//  *       200:
//  *         description: A list of messages
//  *       500:
//  *         description: Internal Server Error
//  */

// /**
//  * @swagger
//  * /contact/{id}:
//  *   delete:
//  *     summary: Delete a message by ID
//  *     tags: [Messages]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: ID of the message to delete
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Message deleted successfully
//  *       404:
//  *         description: Message not found
//  *       500:
//  *         description: Internal Server Error
//  */
