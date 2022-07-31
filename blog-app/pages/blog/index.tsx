import React, { useContext } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Link from "next/link";
import { TrashIcon, PencilIcon } from "@heroicons/react/outline";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import { ProfileContext } from "../../components/layout";

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

const DELETE_BLOG = gql`
  mutation deletePost($id: Int!) {
    deletePost(data: { id: $id }) {
      success
    }
  }
`;

export default function Blog() {
  const context = useContext(ProfileContext);

  const { loading, error, data } = useQuery(GET_BLOGS);
  const [deletePost] = useMutation(DELETE_BLOG, {
    refetchQueries: [{ query: GET_BLOGS }],
  });

  const router = useRouter();

  const handleDelete = (id: number) => {
    confirmAlert({
      title: "Alert",
      message: "Are you sure to delete?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            deletePost({ variables: { id } }).then(
              ({ data: { deletePost } }) => {
                if (deletePost.success) {
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
    router.push(`/blog/update/${id}`);
  };

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to blog site!
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="px-4 py-6 sm:px-0">
            {context.id && (
              <div className="text-right">
                <Link href="/blog/create">
                  <span className="inline-flex justify-center rounded-lg text-sm font-semibold py-3 px-4 bg-slate-900 text-white hover:bg-slate-700 mb-5 cursor-pointer">
                    New blog
                  </span>
                </Link>
              </div>
            )}
            {loading
              ? "Loading..."
              : data.getPosts.posts.map((post: any, index: number) => {
                  return (
                    <div key={post.id} className="mb-3">
                      <Link href={`/blog/${post.id}`}>
                        <span className="text-xl text-blue-600 cursor-pointer">
                          {post.title}{" "}
                          <small className="text-sm">
                            Written by {post.author.name}
                          </small>
                        </span>
                      </Link>
                      {context.id && (
                        <>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="delete-btn ml-5 p-1 border border-transparent rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <TrashIcon
                              className="h-5 w-5 text-indigo-300 delete-btn:text-white"
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            onClick={() => handleEdit(post.id)}
                            className="delete-btn ml-1 p-1 border border-transparent rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <PencilIcon
                              className="h-5 w-5 text-indigo-300 delete-btn:text-white"
                              aria-hidden="true"
                            />
                          </button>
                        </>
                      )}
                      <p>{post.content}</p>
                    </div>
                  );
                })}
          </div>
          {/* /End replace */}
        </div>
      </main>
    </div>
  );
}
