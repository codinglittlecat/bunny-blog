import React, { useContext, useState, useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { LockClosedIcon, TrashIcon, PencilIcon } from "@heroicons/react/solid";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { ProfileContext } from "../../components/layout";

type Inputs = {
  title: String;
  content: string;
};

const GET_BLOG = gql`
  query GetPost($id: Int!) {
    getPost(id: $id) {
      id
      title
      content
      author {
        id
        name
      }
      comments {
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

const CREATE_COMMENT = gql`
  mutation createComment(
    $title: String!
    $content: String!
    $authorId: Int!
    $postId: Int!
  ) {
    createComment(
      title: $title
      content: $content
      authorId: $authorId
      postId: $postId
    ) {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

const UPDATE_COMMENT = gql`
  mutation updateComment($id: Int!, $title: String!, $content: String!) {
    updateComment(id: $id, title: $title, content: $content) {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation deleteComment($id: Int!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

export default function BlogDetail() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Inputs>();

  const context = useContext(ProfileContext);

  const router = useRouter();
  const blogId = router.query.id;

  let { loading, error, data } = useQuery(GET_BLOG, {
    variables: { id: Number(blogId) },
  });
  const [createComment] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_BLOG, variables: { id: Number(blogId) } }],
  });
  const [updateComment] = useMutation(UPDATE_COMMENT, {
    refetchQueries: [{ query: GET_BLOG, variables: { id: Number(blogId) } }],
  });
  const [deleteComment] = useMutation(DELETE_COMMENT, {
    refetchQueries: [{ query: GET_BLOG, variables: { id: Number(blogId) } }],
  });

  const [selectedCommentId, setSelectedCommentId] = useState(-1);

  useEffect(() => {
    if (selectedCommentId != -1) {
      setValue("title", data.getPost.comments[selectedCommentId].title);
      setValue("content", data.getPost.comments[selectedCommentId].content);
    }
  }, [selectedCommentId]);

  if (!blogId) return null;

  const onSubmit: SubmitHandler<Inputs> = (post) => {
    if (selectedCommentId == -1) {
      createComment({
        variables: {
          title: post.title,
          content: post.content,
          authorId: context.id,
          postId: Number(blogId),
        },
      }).then(({ data: { createComment } }) => {
        if (createComment.id) {
          toast.success("Created successfully!");
          setValue("title", "");
          setValue("content", "");
        } else {
          toast.error("Failed!");
        }
      });
    } else {
      updateComment({
        variables: {
          id: data.getPost.comments[selectedCommentId].id,
          title: post.title,
          content: post.content,
        },
      }).then(({ data: { updateComment } }) => {
        if (updateComment.id) {
          toast.success("Updated successfully!");
          setSelectedCommentId(-1);
          setValue("title", "");
          setValue("content", "");
        } else {
          toast.error("Failed!");
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    confirmAlert({
      title: "Alert",
      message: "Are you sure to delete?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            deleteComment({ variables: { id } }).then(
              ({ data: { deleteComment } }) => {
                if (deleteComment.id) {
                  toast.success("Deleted successfully!");
                } else {
                  toast.error("Failed!");
                }
              }
            );
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  const handleEdit = (id: number) => {
    setSelectedCommentId(id);
  };

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {!loading && (
            <h1 className="text-3xl font-bold text-gray-900">
              {data.getPost.title}
              <small className="text-sm ml-2">
                Written by {data.getPost.author.name}
              </small>
            </h1>
          )}
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-3 sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="px-4 py-3 sm:px-0">
            {loading ? (
              "Loading..."
            ) : (
              <div className="mb-3">
                <p className="text-lg">{data.getPost.content}</p>

                <div className="ml-10 mt-5">
                  {data.getPost.comments.map((item: any, index: number) => (
                    <div key={item.id} className="mb-3">
                      <div className="text-md text-blue-600">
                        {item.title}
                        <small className="text-sm ml-2">
                          Written by {item.author.name}
                        </small>
                        {context.id && (
                          <>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="delete-btn ml-5 p-1 border border-transparent rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <TrashIcon
                                className="h-5 w-5 text-indigo-300 delete-btn:text-white"
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              onClick={() => handleEdit(index)}
                              className="delete-btn ml-1 p-1 border border-transparent rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <PencilIcon
                                className="h-5 w-5 text-indigo-300 delete-btn:text-white"
                                aria-hidden="true"
                              />
                            </button>
                          </>
                        )}
                      </div>
                      <p>{item.content}</p>
                    </div>
                  ))}
                  {context.id && (
                    <form
                      className="mt-8 space-y-6 w-4/6 ml-auto"
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
                          {errors.content && (
                            <span>This field is required.</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="xl:w-3/12 lg:w-4/12 group relative ml-auto flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                          {loading ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            {/* /End replace */}
          </div>
        </div>
      </main>
    </div>
  );
}
