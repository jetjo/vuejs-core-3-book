<template>
  <pre>
以上列举的几种情形,不一定都是对所有HTML元素而言的;
因为,有的Attr.是所有HTML元素都有的(识别的),
有的Attr.是仅某些HTML元素才有的.
比如,<code>id</code>属性,是所有HTML元素都有的;
而<code>form</code>属性,仅表单元素才识别,即使设置在不识别此Attr.的元素上,也没有意义.
总之,两者的关系比较复杂;
<mark>基本上,Attr就是用来初始化节点的部分状态的,而节点的部分状态又体现为Prop的值.</mark>
<a href='#/mark1'><mark>注意:情况不总是如此, 比如当为attr设置的值不合法时, 浏览器会忽略此值, 而使用attr相应的默认值.</mark></a>
所以多数情况下,Attr是用来设置与之对应的Prop的初始值的.
渲染得到的节点,其有些Prop是可以被修改的,而有些则不行,这取决于Prop的特性.
而Attr是书写的,可以认为是不变的.
</pre>
</template>
