/* player.css - Video Player Styles - Light Premium Theme */

.player-container {
    max-width: 1400px;
    margin: 0 auto;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #ffffff;
    color: #667eea;
    border: 2px solid #667eea;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 24px;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    transform: translateX(-4px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.back-btn span:first-child {
    font-size: 20px;
}

.video-wrapper {
    background: #000000;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.video-player {
    width: 100%;
    aspect-ratio: 16/9;
    background: #000000;
    display: block;
}

.player-info {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    padding: 24px 32px;
    color: #ffffff;
}

#playerTitle {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #ffffff;
}

#playerCategory {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

/* Responsive Player */
@media (max-width: 768px) {
    .player-container {
        padding: 0;
    }

    .back-btn {
        margin: 0 16px 20px;
    }

    .video-wrapper {
        border-radius: 16px;
    }

    .player-info {
        padding: 20px 24px;
    }

    #playerTitle {
        font-size: 20px;
    }

    #playerCategory {
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .video-wrapper {
        border-radius: 0;
    }

    .player-info {
        padding: 16px 20px;
    }

    #playerTitle {
        font-size: 18px;
    }
}
