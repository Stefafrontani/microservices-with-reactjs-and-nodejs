import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentsList = ({ postId }) => {
    const [ comments, setComments ] = useState([]);

    useEffect(() => {
        async function fetchComments() {
            console.log('fetch comments');
            const res = await axios.get(`http://localhost:4001/posts/${postId}/comments`);
            setComments(res.data);
        };
        fetchComments();
    }, [postId]);

    const renderedComments = comments.map(comment => {
        return (
            <li key={comment.id}>{comment.content}</li>
        );
    });

    return (
        <ul>
            {renderedComments}
        </ul>
    );
}

export default CommentsList;