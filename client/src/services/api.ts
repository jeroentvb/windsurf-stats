import Axios, { AxiosResponse } from 'axios'

async function get (endpoint: string): Promise<AxiosResponse<any>> {
  try {
    const res = await Axios.get(`${process.env.VUE_APP_API_URL}/${endpoint}`, {
      withCredentials: true
    })

    return res
  } catch (err) {
    return err
  }
}

async function post (endpoint: string, payload: any): Promise<AxiosResponse<any>> {
  try {
    const res = await Axios.post(`${process.env.VUE_APP_API_URL}/${endpoint}`, payload, {
      withCredentials: true
    })

    return res
  } catch (err) {
    return err
  }
}

export default {
  get,
  post
}
