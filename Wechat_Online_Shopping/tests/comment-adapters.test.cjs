const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEFAULT_COMMENT_AVATAR,
  adaptCommentItem,
  adaptCommentSummaryResponse,
  adaptCommentsListResponse,
  adaptGoodsDetailsCommentListResponse,
} = require('../services/_utils/comment-adapters');

const DEFAULT_COMMENT_IMAGE = '/assets/images/comments/proof.png';

test('adaptCommentSummaryResponse maps backend summary to comment count cards', () => {
  const result = adaptCommentSummaryResponse({
    code: 'Success',
    data: {
      commentCount: 4,
      goodCount: 2,
      middleCount: 1,
      badCount: 1,
      hasImageCount: 1,
      goodRate: 50,
    },
  });

  assert.deepEqual(result, {
    badCount: 1,
    commentCount: 4,
    goodCount: 2,
    goodRate: 50,
    hasImageCount: 1,
    middleCount: 1,
    uidCount: 0,
  });
});

test('adaptCommentsListResponse maps backend comments to legacy comment list shape', () => {
  const result = adaptCommentsListResponse({
    code: 'Success',
    data: {
      list: [
        {
          id: 'c-1',
          spuId: 88,
          skuId: 301,
          specInfo: [
            { specTitle: '颜色', specValue: '黑色' },
            { specTitle: '容量', specValue: '256G' },
          ],
          commentContent: '整体不错',
          commentResources: [{ src: 'https://cdn.example.com/comment.png' }],
          commentScore: 5,
          uid: 'u-1',
          userName: '测试用户',
          userHeadUrl: '',
          isAnonymity: false,
          commentTime: '1773055606388',
          sellerReply: '感谢支持',
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
      },
    },
  });

  assert.equal(result.pageNum, 1);
  assert.equal(result.pageSize, 10);
  assert.equal(result.totalCount, 1);
  assert.equal(result.pageList.length, 1);
  assert.equal(result.pageList[0].goodsSpu, 88);
  assert.equal(result.pageList[0].userHeadUrl, DEFAULT_COMMENT_AVATAR);
  assert.equal(result.pageList[0].goodsDetailInfo, '规格: 黑色 / 256G');
});

test('adaptGoodsDetailsCommentListResponse keeps only homepage comments for goods detail', () => {
  const result = adaptGoodsDetailsCommentListResponse({
    code: 'Success',
    data: {
      list: [
        { id: '1', spuId: 1, commentScore: 5, commentContent: 'A' },
        { id: '2', spuId: 1, commentScore: 4, commentContent: 'B' },
        { id: '3', spuId: 1, commentScore: 3, commentContent: 'C' },
        { id: '4', spuId: 1, commentScore: 2, commentContent: 'D' },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 4,
      },
    },
  });

  assert.equal(result.totalCount, 4);
  assert.equal(result.homePageComments.length, 3);
  assert.equal(result.homePageComments[2].commentContent, 'C');
});

test('adaptCommentItem normalizes placeholder comment images', () => {
  const result = adaptCommentItem({
    id: 'comment-1',
    spuId: 1,
    commentResources: [{ src: 'https://example.com/comment.png', type: 'image' }],
  });

  assert.equal(result.commentResources.length, 1);
  assert.equal(result.commentResources[0].src, DEFAULT_COMMENT_IMAGE);
});
