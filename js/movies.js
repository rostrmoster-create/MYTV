/* movies.css - Movies Section Styles - Light Premium Theme */

/* Movies Grid */
.movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 28px;
}

.movie-card {
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    position: relative;
    border: 2px solid transparent;
}

.movie-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(102, 126, 234, 0.2);
    border-color: #667eea;
}

/* Movie Poster */
.movie-poster {
    position: relative;
    width: 100%;
    aspect-ratio: 2/3;
    overflow: hidden;
    background: linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%);
}

.movie-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
    transform: scale(1.05);
}

/* Movie Overlay */
.movie-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 20px;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.movie-card:hover .movie-overlay {
    opacity: 1;
}

/* Play Button */
.play-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.play-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.play-icon {
    font-size: 16px;
}

/* Info Button */
.info-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.95);
    color: #1e293b;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.info-btn:hover {
    background: #ffffff;
    transform: scale(1.05);
}

/* Movie Info */
.movie-info {
    padding: 16px;
}

.movie-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
}

.movie-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 13px;
}

.movie-year {
    color: #64748b;
    font-weight: 600;
}

.movie-rating {
    color: #f59e0b;
    font-weight: 600;
}

/* Movie Modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: #ffffff;
    border-radius: 24px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.close-modal {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.3s ease;
}

.close-modal:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: rotate(90deg);
}

.modal-body {
    display: flex;
    gap: 32px;
    padding: 40px;
}

.modal-poster {
    flex-shrink: 0;
    width: 300px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.modal-poster img {
    width: 100%;
    height: auto;
    display: block;
}

.modal-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

#modalTitle {
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 16px;
    line-height: 1.2;
}

.modal-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 2px solid #e2e8f0;
}

.modal-meta span {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    padding: 6px 14px;
    background: linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%);
    border-radius: 8px;
}

#modalRating {
    color: #f59e0b;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.modal-description {
    font-size: 15px;
    line-height: 1.7;
    color: #475569;
    margin-bottom: 32px;
    flex: 1;
}

.modal-play-btn {
    padding: 16px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    align-self: flex-start;
}

.modal-play-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(102, 126, 234, 0.5);
}

.modal-play-btn span {
    font-size: 18px;
}

/* Responsive Modal */
@media (max-width: 768px) {
    .modal-body {
        flex-direction: column;
        padding: 24px;
    }

    .modal-poster {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
    }

    #modalTitle {
        font-size: 24px;
    }

    .modal-meta {
        gap: 10px;
    }

    .modal-meta span {
        font-size: 12px;
        padding: 5px 12px;
    }

    .modal-description {
        font-size: 14px;
    }

    .modal-play-btn {
        width: 100%;
        padding: 14px;
    }

    .close-modal {
        top: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        font-size: 20px;
    }
}

/* Scrollbar for Modal */
.modal-content::-webkit-scrollbar {
    width: 8px;
}

.modal-content::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.modal-content::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
}
