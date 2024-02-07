const arrayCopyMethods = [
  {
    name: 'with',
    protoImpl: Array.prototype.with,
    // vue并没有对with返回的结果做代理, 所以目前看不需要重写;
    // 况且`with`是个纯函数
    // 但是这样的话,经过代理调用此方法得到的结果却不是代理了
    needRewrite: false
  },
  {
    name: 'copyWithin',
    protoImpl: Array.prototype.copyWithin,
    // 就地更改当前数组,将一部分位置的元素复制到另一部分位置, 返回当前数组
    // 这个方法很恶心,很复杂,搁置
    needRewrite: false,
    // 检查两个effect中对此方法的调用,是否相互影响从而引发死循环
    // 例如:有一个长度为10的数组,假设从索引为5的元素开始往后的元素都是不会被改变的,并且数组元素没有重复各不相同;
    // 现在有两个effect,一个effect调用copyWithin(3,4,6),另一个effect调用copyWithin(2,4,7);
    // 分析可知,这两个effect都会读取并修改索引为4的元素,
    // 一个effect讲索引为5的元素复制到索引为4的位置,
    // 而另一个effect将索引为6的元素复制到索引为5的位置;
    // 因为索引5和索引6的元素值不相等,而两个effect都依赖于索引4;
    // 这就会导致两个effect相互触发,从而导致死循环;

    // 获取此次调用copyWithin既要读取又要设置的索引列表
    /**@typedef {{target:number,start:number, end?:number}} CopyWithinArg */
    /**@param {CopyWithinArg} effectArgs */
    getSourceIndexs: function (effectArgs) {
      // 获取effect1中调用copyWithin时,既要读取又要修改的索引
      const {
        target: pasteStartPos,
        start: copyStartPos,
        end: _copyEndPos
      } = effectArgs
      // 要复制的元素的数量
      const copyLen = _copyEndPos - copyStartPos
      // 要粘贴到的目标区域的最大索引
      const pasteEndPos = pasteStartPos + copyLen - 1
      // 判断索引为i的元素是否在effect1中被读取并修改
      const copyEndPos = _copyEndPos - 1
      const isEffect1ReadAndModify = (_ => {
        if (pasteEndPos - copyStartPos < copyEndPos - pasteStartPos) {
          return i => i >= copyStartPos && i <= pasteEndPos
        }
        return i => i >= pasteStartPos && i <= copyEndPos
      })()
      // 要设置值的目标索引与值的来源索引的偏移量
      const offset = copyStartPos - pasteStartPos
      // 计算目标索引j的值的来源索引的肩头函数
      /**@param {number} j */
      const getSrcIndex = j => j + offset
      const indexs = [pasteStartPos, pasteEndPos, copyStartPos, copyEndPos]
      // 获取此次调用copyWithin所涉及的区块的起始和终止索引
      const [minIndex, maxIndex] = [Math.min(...indexs), Math.max(...indexs)]
      const indexsWR = []
      if (pasteStartPos > copyEndPos || copyStartPos > pasteEndPos)
        return indexsWR
      for (let i = minIndex; i <= maxIndex; i++) {
        if (isEffect1ReadAndModify(i)) {
          // 获取索引i的值的来源索引
          const srcIndex = getSrcIndex(i)
          indexsWR.push([i, srcIndex])
        }
      }
      return indexsWR
    },
    /**
     *
     * @param {CopyWithinArg} effect1Args
     * @param {CopyWithinArg} effect2Args
     * @returns {boolean}
     */
    checkIfEndlessTrigger: function (effect1Args, effect2Args) {
      const [indexs1, indexs2] = [
        this.getSourceIndexs(effect1Args),
        this.getSourceIndexs(effect2Args)
      ]
      const indexsDiffSource = []
      for (let i = 0; i < indexs1.length; i++) {
        const [index1, srcIndex1] = indexs1[i]
        for (let j = 0; j < indexs2.length; j++) {
          const [index2, srcIndex2] = indexs2[j]
          if (index1 === index2 && srcIndex1 !== srcIndex2) {
            indexsDiffSource.push([index1, srcIndex1, srcIndex2])
          }
        }
      }
      const isEndlessTrigger = indexsDiffSource.length > 0
      return isEndlessTrigger
    }
  }
]

export { arrayCopyMethods }
