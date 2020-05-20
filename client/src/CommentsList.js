import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentsList = ({ comments }) => {
    const renderedComments = comments.map(comment => {
        let content;

        switch (comment.status) {
            case 'approved':
                content = comment.content;
                break;
            case 'pending':
                content = 'Awaiting moderation for the comment';
                break;
            case 'rejected':
                content = 'Comment banned';
                break;
            default:
                return;
          }
        return (
            <li key={comment.id}>{content}</li>
        );
    });

    return (
        <ul>
            {renderedComments}
        </ul>
    );
}

export default CommentsList;