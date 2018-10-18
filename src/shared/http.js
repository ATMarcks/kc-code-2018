import axios from 'axios'

const port = process.env.NODE_ENV === 'production' ? '' : ':8081'

export default axios.create({
    baseURL: `http://${process.env.host || 'localhost'}${port}/api/`
})
