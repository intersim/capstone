
#API Routes

Base URI: `/api`

#Users

`GET /users` - Retrieve all users
`POST /users` - Create a new user
`GET /users/:userId` - Retrieve user with ID `userId`
`PUT /users/:userId` - Update user with ID `userId` (admin or self only)
`DELETE /users/:userId` - Remove user with ID `userId` (admin or self only)
`GET /users/:userId/compositions` - Retrieve all compositions created by user with ID `userId` (creator also retrieves unpublished compositions)
`GET /users/:userId/loops` - Retrieve loops created by user with ID `userId` (creator also retrieves unpublished loops)

#Loops

`GET /loops` - Retrieve all loops
`POST /loops` - Create a new loop
`GET /loops/:loopId` - Retrieve loop with ID `loopId`
`PUT /loops/:loopId` - Update loop with ID `loopId` (can only be performed by creator, and only if loop is unpublished)
`DELETE /loops/:loopId` - Remove loop with ID `loopId` (can only be performed by creator, and only if loop is unpublished)

#Compositions

`GET /compositions` - Retrieve all public compositions, with tracks and loops populated
`POST /compositions` - Create new composition, create all tracks, and add tracks to the new composition
`GET /compositions/:compositionId` - Retrieve composition with ID `compositionId`
`PUT /compositions/:compositionId` - Update composition with ID `compositionId`, deleting removed tracks and creating added tracks (can only be performed by creator or admin)
`DELETE /compositions/:compositionId` - Delete composition with ID `compositionId` and all of its tracks (can only be performed by creator or admin
`GET /compositions/comments` - Get all comments on composition with ID `compositionId`
`POST /compositions/comments` - Create a new comment on composition with ID `compositionId`
