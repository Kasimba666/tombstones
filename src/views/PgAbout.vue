<template>
  <div class="PgAbout">
    <div class="my-title-text">о проекте</div>
    <div class="main-text">
       <p>Изучение эпиграфических памятников, булгаро-татарских намогильных камней — это исследования
      средневековых изображений, повествующих о жизни и верованиях наших предков, и одновременно —
      сложнейший процесс спасения и возвращения из небытия огромной части культурного наследия
      России. Эпиграфические памятники XIII–XVII вв. представляют собой уникальные источники по истории
      татарского народа. Они воплотили в себе преимущества и письменных, и вещественных источников. Как
      вещественные – они оригинальны и не имеют позднейших аналогов, как письменные – дают
      разностороннюю информацию исторического, социально-политического, этнического и культурного
      характера. Документирование этих памятников — трудоёмкий, но важный процесс сохранения
      наследия для потомков. Многие памятники, изученные в середине XX в., физически не сохранились или
      надписи полностью разрушились. Поэтому так остро стоит вопрос о сохранности и охране данного
      вида памятников. Основная задача нашего проекта состоит в изучении эпиграфических памятников
      булгаро-татарского времени на современном методическом уровне, заключающееся их
      документировании, виртуальной музеефикации, перевод в 3D, каталогизация, дешифровка и
      прочтение, а также оценки их современного состояния с использованием актуальных подходов к
      изучению историко-культурного наследия.</p>
      <p>На данном ресурсе представлена информация о булгаро-татарском эпиграфическом наследии, 3D-
      модели, карты размещения намогильных камней на территории Республики Татарстан.</p>
    </div>
    <div class="my-button">
      <div class="my-button-img"
           style="background-image: url('/assets/signs/ornament.svg');"
           @click="$router.push({name: 'ObjsFiltersAndList'})"
      >
      </div>
      <div class="my-button-text">Перейти к списку камней</div>
    </div>
    <div class="my-signs">
      <div class="my-signs-item"
           style="background-image: url('/assets/signs/tatarstones.png');"
           @click="navigateTo('https://tatarstones.ru/about')"
      >
      </div>
      <div class="my-signs-item"
           style="background-image: url('/assets/signs/institut_istorii.svg'); height: 68px"
           @click="navigateTo('http://татаровед.рф')"
      >
      </div>
      <div class="my-signs-item"
           style="background-image: url('/assets/signs/rnf.png');"
           @click="navigateTo('https://rscf.ru')"
      >
      </div>
      <div class="my-signs-item"
           style="background-image: url('/assets/signs/an_rt.png');"
           @click="navigateTo('https://www.antat.ru')"
      >
      </div>
    </div>
    <div class="my-contacts">
      контакты: tatarstones@mail.ru
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: [],
  data() {
    return {}
  },
  computed: {},
  methods: {
    navigateTo(url) {
      window.open(url, '_blank'); // Открывает сайт в новой вкладке
    },
  },
  mounted() {
  },
}
</script>

<style lang="scss">
.PgAbout {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 80dvh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: center;
  //font-family: 'Century Schoolbook', serif;
  font-size: 18px;


  .my-title-text {
    width: 100%;
    height: auto;
    text-align: center;
    margin-bottom: 5px;
    font-size: 18px;
    font-weight: bold;
    color: hsl(0, 0%, 40%);
    //color: grey;
    padding-top: 10px;
  }
  .main-text {
    width: 100%;
    height: auto;
    align-text: center;
    text-indent: 30px;
    color: hsl(0, 0%, 25%);
    margin-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px;
    p {
      //font-family: 'Century Schoolbook', serif;
      font-size: 18px;
    }

  }

  .my-signs {
    position: relative;
    width: 100%;
    //height: 90px;
    height: auto;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    gap: 15px;
    //border: 1px solid gray;
    background-color: hsl(0, 0%, 100%, 0.7);
    .my-signs-item {
      width: 70px;
      height: 70px;
      flex: 0 1 auto;
      aspect-ratio: 1 / 1;
      background-size: contain; /* Изображение вписывается, сохраняя пропорции */
      background-repeat: no-repeat; /* Изображение не повторяется */
      background-position: center; /* Изображение центрируется в кнопке */
      border-radius: 8px;
      cursor: pointer;
      //border: 1px solid gray;
      margin-top: 5px;
      transition: transform 0.2s;
      &:hover {
        transform: scale(1.03);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Увеличенная тень при наведении */
      }
    }
  }
  .my-button {
    width: 200px;
    height: 90px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
    border: 3px solid hsl(60, 0%, 60%);
    margin-bottom: 10px;

    &:hover {
      box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
    }
    .my-button-img {
      width: 60px;
      height: 60px;
      aspect-ratio: 1 / 1;
      background-size: contain; /* Изображение вписывается, сохраняя пропорции */
      background-repeat: no-repeat; /* Изображение не повторяется */
      background-position: center; /* Изображение центрируется в кнопке */
      border-radius: 8px;
      cursor: pointer;
    }
    .my-button-text {
      position: relative;
      height: 30px;
      font-size: 14px;
      font-weight: bold;
      color: hsl(60, 0%, 40%);

    }
  }
  .my-contacts {
    position: relative;
    width: 100%;
    height: 30px;
    text-align: center;
    font-size: 16px;
    margin-top: 10px;
  }
}
</style>
