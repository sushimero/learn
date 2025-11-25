package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// 1. モデル定義 (DBのテーブル構造)
type Todo struct {
	gorm.Model
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

var db *gorm.DB

func main() {
	var err error
	// 2. データベース接続 (SQLite)
	db, err = gorm.Open(sqlite.Open("Todo.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// 3. マイグレーション (テーブルの自動作成)
	db.AutoMigrate(&Todo{})

	// 4. Ginルーターの設定
	r := gin.Default()

	// CORS設定 (React:3000 から Go:8080 へのアクセスを許可)
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"}, // ReactのURL
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Origin", "Content-Type"},
	}))

	// 5. APIルート定義
	r.GET("/todos", getTodos)
	r.POST("/todos", createTodo)
	r.PUT("/todos/:id", updateTodo)
	r.DELETE("/todos/:id", deleteTodo)

	// サーバー起動
	r.Run(":8080")
}

// --- ハンドラー関数 ---

// Todo一覧取得
func getTodos(c *gin.Context) {
	var todos []Todo
	db.Find(&todos)
	c.JSON(200, todos)
}

// Todo作成
func createTodo(c *gin.Context) {
	var todo Todo
	if err := c.ShouldBindJSON(&todo); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	db.Create(&todo)
	c.JSON(200, todo)
}

// Todo更新 (完了状態の切り替えなど)
func updateTodo(c *gin.Context) {
	id := c.Param("id")
	var todo Todo
	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Todo not found"})
		return
	}
	c.ShouldBindJSON(&todo) // リクエストボディの内容で更新
	db.Save(&todo)
	c.JSON(200, todo)
}

// Todo削除
func deleteTodo(c *gin.Context) {
	id := c.Param("id")
	db.Delete(&Todo{}, id)
	c.JSON(200, gin.H{"message": "deleted"})
}

