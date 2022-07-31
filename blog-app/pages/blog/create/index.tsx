import React, { useContext } from "react";
import { LockClosedIcon } from "@heroicons/react/solid";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "@apollo/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import { ProfileContext } from "../../../components/layout";

type Inputs = {
  title: String;
  content: string;
};

const CREATE_BLOG = gql`
  mutation createPost($title: String!, $content: String!, $authorId: Int!) {
    createPost(
      data: { title: $title, content: $content, authorId: $authorId }
    ) {
      success
    }
  }
`;

const GET_BLOGS = gql`
  query GetPosts {
    getPosts {
      posts {
        id
        title
        content
        author {
          id
          name
        }
      }
    }
  }
`;

export default function Blog() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const context = useContext(ProfileContext);

  const router = useRouter();

  const [createPost, { data, loading, error }] = useMutation(CREATE_BLOG, {
    refetchQueries: [{ query: GET_BLOGS }],
  });

  const onSubmit: SubmitHandler<Inputs> = (post) => {
    createPost({
      variables: {
        title: post.title,
        content: post.content,
        authorId: context.id,
      },
    }).then(({ data: { createPost } }) => {
      if (createPost.success) {
        toast.success("Created successfully!");
        router.push("/blog");
      } else {
        toast.error("Failed!");
      }
    });
  };

  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create a Blog
            </h2>
          </div>
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">
                  Title
                </label>
                <input
                  {...register("title", { required: true })}
                  autoComplete="name"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Title"
                />
                {errors.title && <span>This field is required.</span>}
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Content
                </label>
                <textarea
                  {...register("content", { required: true })}
                  autoComplete="content"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Content"
                />
                {errors.content && <span>This field is required.</span>}
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-3 ..."
                      viewBox="0 0 24 24"
                    ></svg>
                  ) : (
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  )}
                </span>
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
