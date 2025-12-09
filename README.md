<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">NestJS шаблон для разработки API Backend</p>

## Описание
Шаблон использует следующие инструменты:
* Swagger и Rapidoc для Документации
* TypeORM с PostgreSQL
* Redis для кэширование

## Структура проекта
* `src` - содержит весь исходный код
    
  * `const` - содержит константные значения
  * `database` - содержит все настройки связанные с базами данных
  * `features` - содержит директории модулей основной логики
* `test` - содержит файлы тестирования
* `uploads` - содержит статичные файлы, доступные по ссылке 

## Установка библиотек

```bash
yarn install
```

## Компиляция и запуск
### Запуск при разработке
```bash
yarn run start
```
### Запуск при разработке с watch режимом 
```bash
yarn run start:dev
```
### Запуск на проде
```bash
yarn run start:prod
```

## Запуск тестов

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Список установленных библиотек

```bash
@nestjs/typeorm typeorm @nestjs/config @nestjs/throttler @nestjs/cache-manager cache-manager cache-manager-redis-store pg @nestjs/swagger @nestjs/serve-static @nestjs/passport passport-jwt
```