import { API_BASE_URL as API_URL } from "../config";



/* =========================
   TYPES
========================= */


export interface BlogPost {

    blogPostId:number;

    title:string;

    slug:string;

    category:string;

    excerpt:string;

    content:string;

    coverImage:string;

    author:string;

    isPublished:boolean;

    createdDate?:string;

    publishDate:string | null;

}



export interface CreateBlogPostRequest {

    title:string;

    category:string;

    content:string;

    isPublished:boolean;

}





/* =========================
   API HELPER
========================= */


async function apiRequest<T>(
    url:string,
    options:RequestInit = {}
):Promise<T>
{

    const token =
        localStorage.getItem(
            "token"
        );



    const response =
    await fetch(
        url,
        {

            ...options,


            headers:
            {

                "Content-Type":
                    "application/json",


                ...(token
                    ? {
                        Authorization:
                            `Bearer ${token}`
                    }
                    : {}),


                ...options.headers

            }

        }
    );



    if(!response.ok)
    {

        const error =
            await response.text();


        throw new Error(
            error ||
            "API request failed"
        );

    }



    return response.json();

}







/* =========================
   ADMIN
   GET ALL BLOGS
   GET /api/admin/blog
========================= */


export async function getAdminBlogs()
:Promise<BlogPost[]>
{

    return apiRequest<BlogPost[]>(

        `${API_URL}/admin/blog`

    );

}







/* =========================
   ADMIN
   CREATE BLOG
   POST /api/admin/blog
========================= */


export async function createBlogPost(

    data:CreateBlogPostRequest

)
:Promise<BlogPost>
{


    return apiRequest<BlogPost>(

        `${API_URL}/admin/blog`,

        {

            method:
                "POST",


            body:
                JSON.stringify(data)

        }

    );

}







/* =========================
   PUBLIC
   GET PUBLISHED BLOGS
   GET /api/blog
========================= */


export async function getPublicBlogs()
:Promise<BlogPost[]>
{

    return apiRequest<BlogPost[]>(

        `${API_URL}/blog`

    );

}