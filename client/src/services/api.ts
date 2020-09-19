import Axios, { AxiosResponse } from 'axios'

async function get<T = any> (endpoint: string): Promise<AxiosResponse<T>> {
  try {
    const res = await Axios.get(`${process.env.VUE_APP_API_URL}/${endpoint}`, {
      withCredentials: true
    })

    return res
  } catch (err) {
    throw err
  }
}

async function post (endpoint: string, payload: any): Promise<AxiosResponse<any>> {
  try {
    const res = await Axios.post(`${process.env.VUE_APP_API_URL}/${endpoint}`, payload, {
      withCredentials: true
    })

    return res
  } catch (err) {
    throw err
  }
}

async function patch (endpoint: string, payload: any): Promise<AxiosResponse<any>> {
  try {
    const res = await Axios.patch(`${process.env.VUE_APP_API_URL}/${endpoint}`, payload, {
      withCredentials: true
    })

    return res
  } catch (err) {
    throw err
  }
}

export default {
  get,
  post,
  patch
}
