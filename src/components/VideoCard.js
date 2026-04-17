import React from 'react';

const VideoCard = ({ video }) => {
  const { title, channel, views, publishedAt, duration, thumbnail, tag, maker, isNew, videoId } = video;

  return (
    <div
      className="video-card"
      onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
    >
      <div className="video-thumb">
        <img src={thumbnail} alt={title} />
        <span className="video-duration">{duration}</span>
        {isNew && <span className="video-badge">NEW</span>}
      </div>
      <div className="video-info">
        <p className="video-title">{title}</p>
        <div className="video-bottom">
          <div className="video-meta">
            <span className="video-channel">{channel}</span>
            <span className="video-dot">·</span>
            <span className="video-views">{views}</span>
            <span className="video-time">{publishedAt}</span>
          </div>
          <div className="video-tags">
            {maker && <span className="video-maker-tag">{maker}</span>}
            {tag && <span className="video-tag"># {tag}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
