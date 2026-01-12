import { createStart } from "@tanstack/react-start";
import { createMiddleware } from "@tanstack/react-start";
import { authMiddleware } from "./middlewares/auth";

const myGlobalMiddleware = createMiddleware({type: 'request'}).server(({request, next}) => {
    const url = new URL(request.url)
    console.log(url.pathname)
    return next()
})

export const startInstance = createStart(() => {
    return {
        requestMiddleware: [myGlobalMiddleware, authMiddleware],
    }
})