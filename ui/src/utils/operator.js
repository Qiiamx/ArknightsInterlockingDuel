import branches from '@/assets/branches.json'
import operators from '@/assets/operators.json'
// 根据ban掉的干员索引， ban掉的分支索引, ban掉的稀有度，随机获得num个符合要求的干员索引
export const getOprIdx = (num, excludeOprSequence, banBranches, banRare)=>{
  // 1. 被禁分支名集合
  const banBranchesNames = new Set(
    banBranches.map(i => branches[i]?.分支).filter(Boolean)
  )

  // 2. 被禁干员索引集合
  const banSet = new Set(excludeOprSequence.flat())

  // 3. 所有可用下标
  const pool = operators
    .map((op, idx) =>
      !banSet.has(idx) && !banBranchesNames.has(op.分支) && (banRare==null || banRare!=op.稀有度) ? idx : -1
    )
    .filter(idx => idx !== -1)

  // 4. 不够就全返回
  if (pool.length <= num) return pool

  // 5. Fisher–Yates 洗牌取前 num 个
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, num)
}

export const getLastOprCount = (excludeOprSequence, banBranches)=>{
  // 1. 被禁分支名集合
  const banBranchesNames = new Set(
    banBranches.map(i => branches[i]?.分支).filter(Boolean)
  )

  // 2. 被禁干员索引集合
  const banSet = new Set(excludeOprSequence.flat())

  // 3. 所有可用下标
  const pool = operators
    .map((op, idx) =>
      !banSet.has(idx) && !banBranchesNames.has(op.分支) ? idx : -1
    )
    .filter(idx => idx !== -1)

  // 4. 不够就全返回
  return pool.length
}

// 根据干员索引， 获取分支索引
export const getBranchIdx = (oprIdx)=>{
  const op = operators[oprIdx];
  if (!op) return -1;                         // 越界保护
  return branches.findIndex(b => b.分支 === op.分支);
}