# graphql-api-template
graphql-api-template은 MSA(MicroService Architecture) 형태의 서비스 개발을 위한, graphql 기반의 api repository template입니다.

해당 템플릿은 하나의 전체 프로덕트를 이루는 각각의 비즈니스 스코프에 따른 애플리케이션을 독립적으로 개발 및 관리하기 위한 템플릿으로 활용됩니다. 

</br>

# Getting Started
1. Clone the repository

    ```shell
    $ git clone git@github.com:bellti9er/graphql-api-template.git

    $ git clone https://github.com/bellti9er/graphql-api-template.git
    ```

</br>

2. Install dependencies

    ```shell
    $ npm install
    ```

</br>

3. Write `.env` file for your environment

    ```
    . . . 
    ```

</br>

4. Build and run the project as local server

    ```shell
    $ npm run dev
    ```

</br>

5. Running tests using NPM scripts

    ```shell
    $ npm test [individual test-files]
    ```

</br>

# Project Structures
이 템플릿은 주로 `api`, `schema`, `tests`와 같은 디렉토리와 `app.ts`, `aws_lambda.ts`, `local-server.ts`, `database.ts` 등의 주요 파일들로 이루어져 있으며 이에 대한 설명은 아래와 같습니다. 

- `api` : 이 디렉토리는 API의 핵심 로직을 담고 있습니다. 서브 디렉토리로는 `service`와 `model`이 있습니다.

  - `service` : 비즈니스 로직을 처리합니다.
  - `model` : 데이터베이스와의 상호작용을 처리합니다.

- `schema` : 이 디렉토리는 GrapqhQL 스키마를 포함하고 있습니다. type-graphql을 활용하여 특정 타입에 대한 query와 mutation을 정의합니다.

- `tests` : 이 디렉토리는 테스트 코드와 관련된 모든 것을 관리합니다. 서브 디렉토리로는 `fixtures`와 `tests`가 있으며, 주요 파일로는 `test-client.ts`, `aws-lambda-tester.ts`가 있습니다. 

  - `fixtures` : 앞으로 계속해서 작성 될 각 test의 신뢰성을 높이고, 반복성을 보장하도록 해당 서브 디렉토리를 활용하여 코드의 재사용성과 테스트 코드의 가독성 및 유지 보수성을 향상 시킵니다.
  - `tests` : 각각의 test case를 작성합니다.
  - `test-client.ts` : 테스트 환경에서의 데이터베이스 작업을 수행하는데 필요한 코드를 정의합니다.
  - `aws-lambda-tester.ts` : Lambda 함수에 대한 테스트를 위해 API Gateway Event와 Lambda Context를 mocking 하는 코드를 정의합니다.

- `app.ts` : 어플리케이션의 메인 엔트리 포인트입니다. App에 대한 설정과 초기화를 담당합니다.
- `aws_lambda.ts` : 서버를 AWS Lambda 환경에서 실행할 때 사용됩니다. 
- `local-server.ts` : 서버를 로컬 환경에서 실행할 때 사용됩니다. 이를 통해 클라우드 환경에 직접 배포 없이, api 개발 단계에서의 작업과 디버깅을 용이하게 합니다.
- `database.ts` : 데이터베이스 커넥팅 및 설정을 관리하고, 기존의 데이터베이스 관련 라이브러리의 기능에 더해 작업에 유용성을 추가합니다.


</br>

# Endpoint Schema Guide

이 프로젝트에서는 각 엔드포인트에 해당하는 스키마를 정의하기 위해 `type-graphql`을 사용합니다. 


이는 Typescript의 기능을 활용하도록 설계되어 있기에 type system을 활용하여 query와 mutation의 입출력을 명확하게 정의하여 안정성을 높이고 버그를 미리 잡는데 도움이 됩니다. 

</br>


1. 먼저, GrapqhQL 오브젝트 타입을 정의합니다. 이때 `@OjbectType()` 데코레이터 혹은 `@ArgsType()` 데코레이터등을 용도에 따라 사용합니다.

    ```typescript
    @ObjectType()
    class User {

      @Field()
      id: number;

      @Field()
      name: string;

    }

    @ArgsType()
    class UserArgs {

      @Field()
      name: string;

    }
    ```

</br>

2. 그 다음 Resolver 클래스를 데코레이터를 사용하여 정의합니다.

    ```typescript
    @Resolver(of => User)
    class UserResolver {

      @Mutation(returns => User)
      async createUser(
        @Args() { name }: UserArgs, 
        @Ctx() context: Context
      ) {
        return context.api.userService.createUser(name);
      }

    }
    ```

</br>

3. 이때, `decorators.ts`에 custom하게 정의해놓은 `LoginRequired()` 함수를 데코레이터로 활용함으로써 로그인이 필요하거나 식별값이 필요한 query나 mutation을 작성할 수 있습니다. 

    ```typescript
    class UserResolver {

      @LoginRequired()
      @Query(returns => User)
      async getUser(@Ctx() context: Context) {
        const userId = context.request.user.id  // get Identification value with auth token
        return context.api.userService.createUser(name);
      }

    }
    ```

</br>

# Git Commit Message Template

첨부된 `.gitmessga.txt` 파일을 사용하여 git commit message에 대한 통일된 포맷을 유지할 수 있습니다.

1. 터미널을 열고 아래의 명령어를 입력하여 git이 해당 파일을 commit message template으로써 사용하도록 설정합니다.

    ```shell
    $ git config commit.template .gitmessage.txt
    ```

    위의 명령어는 current repository에만 적용되므로, 모든 repository에서 템플릿을 사용하려면 `--global` 옵션을 추가합니다.

    ```shell
    $ git config --global commit.template .gitmessage.txt 
    ```

    </br>

2. 이제 commit 명령어를 실행하면 편집기가 열리면서 `.gitmessage.txt`의 내용을 활용할 수 있습니다.

    ```shell
    $ git commit
    ```