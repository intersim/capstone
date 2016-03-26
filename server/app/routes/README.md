
#API Routes

Base URI: `/api`

| Method | URI | Action | Access Allowed to |
| --- | --- | --- | --- |
| `GET` | `/users` | Retrieve all users | all guests & users |
| `POST` | `/users` | Create a new user | all guests |
| `GET` | `/users/:userId` | Retrieve user with ID `userId` | guests, users |
| `GET` | `/users/:userId/followers` | Retrieve list of all users currently following user with ID `userId` | all guests, users |
| `PUT` | `/users/:userId` | Update user with ID `userId` | admin, current user |
| `DELETE` | `/users/:userId` | Remove user with ID `userId` | admin, current user |
| `GET` | `/users/:userId/compositions` | Retrieve all compositions created by user with ID `userId` (creator also retrieves unpublished compositions) | all guests & users
| `GET` | `/users/:userId/loops` | Retrieve loops created by user with ID `userId` (creator also retrieves unpublished loops) | all guests & users |
| `GET` | `/loops` | Retrieve all loops | all guests & users |
| `POST` | `/loops` | Create a new loop | all users |
| `GET` | `/loops/:loopId` | Retrieve loop with ID `loopId` | all guests & users | 
| `PUT` | `/loops/:loopId` | Update loop with ID `loopId` (can only be performed by creator, and only if loop is unpublished) | creator or admin only |
| `DELETE` | `/loops/:loopId` | Remove loop with ID `loopId` (can only be performed by creator, and only if loop is unpublished) | creator or admin only |
| `GET` | `/loops/:loopId/compositions` | Get all compositions that contain the loop with ID `loopId` | all guests & users |
| `GET` | `/compositions` | Retrieve all public compositions, with tracks and loops populated | all guests & users |
| `POST` | `/compositions` | Create new composition, create all tracks, and add tracks to the new composition | all users |
| `GET` | `/compositions/:compositionId` | Retrieve composition with ID `compositionId` | all guests & users |
| `PUT` | `/compositions/:compositionId` | Update composition with ID `compositionId`, deleting removed tracks and creating added tracks (can only be performed by creator or admin) | creator or admin only |
| `DELETE` | `/compositions/:compositionId` | Delete composition with ID `compositionId` and all of its tracks (can only be performed by creator or admin | creator or admin only |
| `GET` | `/compositions/:compositionId/comments` | Get all comments on composition with ID `compositionId` | all guests & users
| `POST` | `/compositions/:compositionId/comments` | Create a new comment on composition with ID `compositionId` | all users, except composition creator |
| `PUT` | `/compositions/:compositionId/comments/:commentId` | Update comment with ID `commentId` | author of comment & admin |
| `DELETE` | `/compositions/:compositionId/comments/:commentId` | Delete comment with ID `commentId` | author of comment & admin |
