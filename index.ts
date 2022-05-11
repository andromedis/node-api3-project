// require your server and launch it
import { server } from './api/server';
const port: number = 2222;

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})