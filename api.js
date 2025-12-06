(function(global){
  const sampleUsers = [
    { firstname: "Іван", lastname: "Коваленко", score: 12 },
    { firstname: "Олена", lastname: "Петренко", score: 34 },
    { firstname: "Марія", lastname: "Іванова", score: 27 },
    { firstname: "Андрій", lastname: "Шевченко", score: 18 },
    { firstname: "Олексій", lastname: "Бондар", score: 45 },
    { firstname: "Наталя", lastname: "Сидоренко", score: 22 },
    { firstname: "Сергій", lastname: "Мельник", score: 39 },
    { firstname: "Катерина", lastname: "Кравченко", score: 17 },
    { firstname: "Тарас", lastname: "Гончар", score: 30 },
    { firstname: "Вікторія", lastname: "Романюк", score: 26 },
    { firstname: "Михайло", lastname: "Левченко", score: 14 },
    { firstname: "Людмила", lastname: "Захарченко", score: 33 },
    { firstname: "Роман", lastname: "Коваль", score: 21 },
    { firstname: "Ірина", lastname: "Шаповал", score: 11 },
    { firstname: "Остап", lastname: "Клим", score: 29 },
    { firstname: "Юрій", lastname: "Баран", score: 19 },
    { firstname: "Ольга", lastname: "Дрозд", score: 41 },
    { firstname: "Богдан", lastname: "Кирилюк", score: 24 },
    { firstname: "Валентина", lastname: "Ткаченко", score: 16 },
    { firstname: "Ганна", lastname: "Проценко", score: 37 }
  ];

  function pickRandom(arr, n) {
    const copy = arr.slice();
    const result = [];
    while(result.length < n && copy.length) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx,1)[0]);
    }
    return result;
  }

  global.api = {
    fetchUsers: function() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(pickRandom(sampleUsers, 10));
        }, 1000);
      });
    },

    getNewUsers: function() {
      return sampleUsers.slice(0,5);
    },

    _allUsers: sampleUsers
  };
})(window);
