
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
| `GET` | `/users/:userId/mixes` | Retrieve all mixes created by user with ID `userId` (creator also retrieves unpublished mixes) | all guests & users
| `GET` | `/users/:userId/loops` | Retrieve loops created by user with ID `userId` (creator also retrieves unpublished loops) | all guests & users |
| `GET` | `/loops` | Retrieve all loops | all guests & users |
| `POST` | `/loops` | Create a new loop | all users |
| `GET` | `/loops/:loopId` | Retrieve loop with ID `loopId` | all guests & users | 
| `PUT` | `/loops/:loopId` | Update loop with ID `loopId` (can only be performed by creator, and only if loop is unpublished) | creator or admin only |
| `DELETE` | `/loops/:loopId` | Remove loop with ID `loopId` (can only be performed by creator, and only if loop is unpublished) | creator or admin only |
| `GET` | `/loops/:loopId/mixes` | Retrieve list of mixes that contain loop with ID `loopId` | all guests & users |
| `GET` | `/mixes` | Retrieve all public mixes, with tracks and loops populated | all guests & users |
| `POST` | `/mixes` | Create new mix, create all tracks, and add tracks to the new mix | all users |
| `GET` | `/mixes/:mixId` | Retrieve mix with ID `mixId` | all guests & users |
| `PUT` | `/mixes/:mixId` | Update mix with ID `mixId`, deleting removed tracks and creating added tracks (can only be performed by creator or admin) | creator or admin only |
| `DELETE` | `/mixes/:mixId` | Delete mix with ID `mixId` and all of its tracks (can only be performed by creator or admin | creator or admin only |
| `GET` | `/mixes/:mixId/comments` | Get all comments on mix with ID `mixId` | all guests & users
| `POST` | `/mixes/:mixId/comments` | Create a new comment on mix with ID `mixId` | all users, except mix creator |
| `PUT` | `/mixes/:mixId/comments/:commentId` | Update comment with ID `commentId` | author of comment & admin |
| `DELETE` | `/mixes/:mixId/comments/:commentId` | Delete comment with ID `commentId` | author of comment, creator of mix & admin |
