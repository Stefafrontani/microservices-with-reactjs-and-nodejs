import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentsList = ({ comments }) => {
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